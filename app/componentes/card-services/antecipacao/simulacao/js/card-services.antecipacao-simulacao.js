/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.2 - 12/02/2016
 *  - Conta corrente
 *  - Antecipação Bancária
 *
 *  Versão 1.0.1 - 03/02/2016
 *  - Opção de impressão disponível
 *
 *  Versão 1.0 - 20/10/2015
 *
 */

// App
angular.module("card-services-antecipacao-simulacao", []) 

.controller("card-services-antecipacao-simulacaoCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){ 
   
    var IOF = 0.0041; // % a.d.
    var IOFfixo = 0.38; // %   
		$scope.statusSimulacao = false;
		$scope.dataOperacao = "";
		$scope.dataCorte = "";
    $scope.contas = [];   
    $scope.adquirentes = []; 
    $scope.recebiveis = [];                                             
    $scope.vencimentos = [];                                      
    $scope.filtro = { today : new Date(), dtCorte : new Date(), dtOperacao : new Date(), conta : null, adquirente : null,
                      valorDesejado: 0.0, taxa : 0.0, iof : IOF, iofFixo : IOFfixo }; 
    $scope.total = { valorBruto : 0.0, valorDescontado : 0.0, valorLiquido : 0.0, valorAntecipacaoBancaria : 0.0 };  
    $scope.totalVencimento = { valorAntecipado : 0.0, valorJuros : 0.0, valorIOF : 0.0, valorLiquido : 0.0 };
                                                
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRecebiveisPos = 1; // posição da div que vai receber o loading progress                                         
    // flags                                   
    $scope.exibeTela = false;    
    $scope.abrirCalendarioDataOperacao = false;  
    $scope.abrirCalendarioDataCorte = false;                                          
                                                
    // Inicialização do controller
    $scope.cardServices_antecipacaoSimulacaoInit = function(){
        $scope.statusSimulacao = false;			
        // Título da página 
        $scope.pagina.titulo = 'Antecipação';                          
        $scope.pagina.subtitulo = 'Simulação';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.conta = null;
                    $scope.filtro.adquirente = null;
                    buscaContas();
                }else{ // reseta tudo e não faz buscas 
                    $scope.contas = []; 
                    $scope.adquirentes = [];
                    $scope.filtro.conta = null;
                    $scope.filtro.adquirente = null;
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega contas
            buscaContas();
        }); 
        $scope.filtro.dtCorte.setMonth($scope.filtro.dtCorte.getMonth() + 1);
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        buscaContas();
    };                                           
                                                
                                            
    
        
                                                
   /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        // Data para consulta dos recebíveis futuros contabiliza a partir do dia posterior à data da operação
        var data = new Date($scope.filtro.dtCorte.getFullYear(), $scope.filtro.dtCorte.getMonth(), $scope.filtro.dtCorte.getDate());
        //console.log(data);
        data.setDate(data.getDate() + 1);
        
        //console.log($scope.filtro.dtCorte);
        //console.log(data);
        
        // Filtros Por Data
        filtros.push({id: /*$campos.card.recebiveisfuturos.data*/ 100,
                      valor: ">" + $scope.getFiltroData(data)});
			
			$scope.formataData($scope.getFiltroData($scope.filtro.dtCorte), $scope.getFiltroData($scope.filtro.dtOperacao));

        // Adquirente
        if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
           filtros.push({id: /*$campos.card.recebiveisfuturos.cdAdquirente*/ 103, 
                         valor: $scope.filtro.adquirente.cdAdquirente});  
        }

        return filtros;
    }                                             
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        if($scope.filtro.conta && $scope.filtro.conta === null && $scope.filtro.conta.cdContaCorrente !== $scope.contas[0].cdContaCorrente){
            $scope.filtro.conta = $scope.contas[0]; 
            $scope.filtro.adquirente = null;
            $scope.alterouConta();
        }
    }
    
    $scope.exibeCalendarioDataOperacao = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataOperacao = !$scope.abrirCalendarioDataOperacao;
    };
                                                
    $scope.alterouDataOperacao = function(){
        var dt = new Date($scope.filtro.dtOperacao.getFullYear(), $scope.filtro.dtOperacao.getMonth(), $scope.filtro.dtOperacao.getDate());
        var newMonth = ($scope.filtro.dtOperacao.getMonth() + 1) % 12;
        dt.setMonth(dt.getMonth() + 1);
        
        while(dt.getMonth() !== newMonth){
            dt.setDate(dt.getDate() - 1);
        }
        
        if(dt.getFullYear() < $scope.filtro.today.getFullYear() || (dt.getFullYear() === $scope.filtro.today.getFullYear() && dt.getMonth() < $scope.filtro.today.getMonth()) || (dt.getFullYear() === $scope.filtro.today.getFullYear() && dt.getMonth() === $scope.filtro.today.getMonth() && dt.getDate() < $scope.filtro.today.getDate())){
            // Data de corte deve ser igual ou superior a data corrente 
            dt = new Date(); 
        }
        
        // coloca data de corte para um mês depois
        $scope.filtro.dtCorte = dt;
        //console.log($scope.filtro.dtCorte);
        //if(!$scope.$$phase) $scope.$apply();
    }                                           
                                                
                                                
    $scope.exibeCalendarioDataCorte = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataCorte = !$scope.abrirCalendarioDataCorte;
    };                                            
    
    
                                                 
    
    // CONTAS
    /**
      * Busca as contas
      */
    var buscaContas = function(nu_cnpj){
        
       if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                        valor: $scope.usuariologado.grupoempresa.id_grupo},
                       {id: /*$campos.card.tbcontacorrente.flAtivo*/ 106,
                        valor: true}];
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0],
                                filtros)) 
            .then(function(dados){
                $scope.contas = dados.Registros;
                if($scope.filtro.conta && $scope.filtro.conta !== null)
                    $scope.filtro.conta = $filter('filter')($scope.contas, function(c) {return c.cdContaCorrente === $scope.filtro.conta.cdContaCorrente;})[0];
                else
                    $scope.filtro.conta = $scope.contas[0];
                // Busca Adquirentes
                buscaAdquirentes(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma conta
      */
    $scope.alterouConta = function(){
        if($scope.filtro.conta && $scope.filtro.conta !== null){
            // Adquirentes
            buscaAdquirentes();
        }else{
            $scope.adquirentes = [];
            $scope.filtro.adquirente = null;
        }
    }; 
                                                
                                                
                                                
    // ADQUIRENTES
    /**
      * Busca as adquirentes associadas à conta
      */
    var buscaAdquirentes = function(progressEstaAberto){ 
        
       if(!$scope.filtro.conta || $scope.filtro.conta === null){ 
           $scope.filtro.adquirente = null;
           if(progressEstaAberto) $scope.hideProgress(divPortletBodyFiltrosPos);
           return;
       }
            
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.cdContaCorrente*/ 100, 
                       valor: $scope.filtro.conta.cdContaCorrente}];
       
       
       $webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
                                [$scope.token, 4],
                                filtros))
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                $scope.filtro.adquirente = $scope.adquirentes[0]; 
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes da conta (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }  
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        // ...
    };
                                                
                                                
                                                
                                                
    
    // VENCIMENTOS A RECEBER                                            
    /**
      * Obtem os recebíveis a partir dos filtros
      */
    $scope.buscaRecebiveisFuturos = function(){
			
			//BLOQUEIA A IMPRESSÃO
			$scope.statusSimulacao = false;
			
			
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        // Data deve ser superior ou igual a data corrente
        if($scope.filtro.dtCorte && ($scope.filtro.dtCorte.getFullYear() < $scope.filtro.today.getFullYear() || ($scope.filtro.dtCorte.getFullYear() === $scope.filtro.today.getFullYear() && $scope.filtro.dtCorte.getMonth() < $scope.filtro.today.getMonth()) || ($scope.filtro.dtCorte.getFullYear() === $scope.filtro.today.getFullYear() && $scope.filtro.dtCorte.getMonth() === $scope.filtro.today.getMonth() && $scope.filtro.dtCorte.getDate() < $scope.filtro.today.getDate()))){
            $scope.showModalAlerta('Data de corte deve ser igual ou superior a data corrente!', 'Atos Capital', 'OK', 
               function(){
                     $timeout(function(){$scope.exibeCalendarioDataCorte();}, 300);
                }
              );
            return; 
        }
        // Nova busca
        buscaRecebiveisFuturos();
    }
                                                
                                                
    var buscaRecebiveisFuturos = function(){
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyRecebiveisPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
			
       //console.log(filtros);
       $webapi.get($apis.getUrl($apis.card.recebiveisfuturos, [$scope.token, 1], filtros)) 
            .then(function(dados){
                //console.log(dados);
                // Obtém os dados
                $scope.recebiveis = dados.Registros;
                //console.log($scope.recebiveis);
                // Totais
                $scope.total.valorBruto = dados.Totais.valorBruto;
                $scope.total.valorDescontado = dados.Totais.valorDescontado;
                $scope.total.valorAntecipacaoBancaria = dados.Totais.valorAntecipacaoBancaria;
                $scope.total.valorLiquido = dados.Totais.valorLiquido;
                
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRecebiveisPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter vencimentos (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRecebiveisPos);
              });          
        //$scope.hideProgress(divPortletBodyFiltrosPos);
        //$scope.hideProgress(divPortletBodyRecebiveisPos);
    }
    
    
    
    
    /**
      * Reseta taxas de IOF para os valores padrão
      */
    $scope.resetaIOF = function(){
        $scope.filtro.iof = IOF;
        $scope.filtro.iofFixo = IOFfixo;
    }
    
    /**
      * Realiza a simulação
      */
    $scope.simular = function(){
        
        if(!$scope.recebiveis || $scope.recebiveis === null || $scope.recebiveis.length == 0){
            $scope.showModalAlerta('Não há recebíveis futuros!', 'Atos Capital', 'OK');
            return;
        }
        
        if(!$scope.filtro.valorDesejado || $scope.filtro.valorDesejado === null){
            $scope.showModalAlerta('Por favor, informe o valor desejado para antecipação', 'Atos Capital', 'OK');
            return;
        }
        
        // Data de corte
        if($scope.filtro.dtCorte && ($scope.filtro.dtCorte.getFullYear() < $scope.filtro.dtOperacao.getFullYear() || ($scope.filtro.dtCorte.getFullYear() === $scope.filtro.dtOperacao.getFullYear() && $scope.filtro.dtCorte.getMonth() < $scope.filtro.dtOperacao.getMonth()) || ($scope.filtro.dtCorte.getFullYear() === $scope.filtro.dtOperacao.getFullYear() && $scope.filtro.dtCorte.getMonth() === $scope.filtro.dtOperacao.getMonth() && $scope.filtro.dtCorte.getDate() <= $scope.filtro.dtOperacao.getDate()))){
            $scope.showModalAlerta('Data de corte operação deve ser superior a data da operação!', 'Atos Capital', 'OK', 
               function(){
                     $timeout(function(){$scope.exibeCalendarioDataCorte();}, 300);
                }
              );
            return; 
        }
        
        // VALOR DESEJADO
        var valDesejado;
        if(typeof $scope.filtro.valorDesejado === 'string'){
            try{ 
                valDesejado = parseFloat($scope.filtro.valorDesejado.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Valor desejado informado é inválido!');
                return;
            }
        }else valDesejado = $scope.filtro.valorDesejado;
        
        if(valDesejado <= 0.0){
            $scope.showModalAlerta('Valor desejado não pode ser nulo nem negativo!', 'Atos Capital', 'OK');
            return;
        }
        
        if(valDesejado > $scope.total.valorLiquido){
            $scope.showModalAlerta('Valor desejado não pode ser superior ao valor total disponível para antecipação!', 'Atos Capital', 'OK');
            return;
        }
        
        // TAXA
        if(!$scope.filtro.taxa || $scope.filtro.taxa === null){
            $scope.showModalAlerta('Por favor, informe a taxa aplicada (% a.m.)', 'Atos Capital', 'OK');
            return;
        }
        
        var valTaxa;
        if(typeof $scope.filtro.taxa === 'string'){
            try{ 
                valTaxa = parseFloat($scope.filtro.taxa.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Valor da taxa informado é inválido!');
                return;
            }
        }else valTaxa = $scope.filtro.taxa;
        
        if(valTaxa <= 0.0){
            $scope.showModalAlerta('Valor da taxa não pode ser nulo nem negativo!', 'Atos Capital', 'OK');
            return;
        }
        
        
        // IOF
        if(!$scope.filtro.iof || $scope.filtro.iof === null){
            $scope.showModalAlerta('Por favor, informe o IOF (% a.d.)', 'Atos Capital', 'OK');
            return;
        }
        
         if(!$scope.filtro.iofFixo || $scope.filtro.iofFixo === null){
            $scope.showModalAlerta('Por favor, informe o IOF fixo (%)', 'Atos Capital', 'OK');
            return;
        }
        
        var valIOF;
        if(typeof $scope.filtro.iof === 'string'){
            try{ 
                valIOF = parseFloat($scope.filtro.iof.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Valor do IOF informado é inválido!');
                return;
            }
        }else valIOF = $scope.filtro.iof;
        
        var valIOFFixo;
        if(typeof $scope.filtro.iofFixo === 'string'){
            try{ 
                valIOFFixo = parseFloat($scope.filtro.iofFixo.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Valor do IOF fixo informado é inválido!');
                return;
            }
        }else valIOFFixo = $scope.filtro.iofFixo;
        
        if(valIOF <= 0.0 || valIOFFixo <= 0.0){
            $scope.showModalAlerta('Valor o IOF não pode ser nulo nem negativo!', 'Atos Capital', 'OK');
            return;
        }
        
        $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
        $scope.showProgress(divPortletBodyRecebiveisPos);
        
        $scope.totalVencimento.valorAntecipado = 0.0;
        $scope.totalVencimento.valorIOF = 0.0;
        $scope.totalVencimento.valorJuros = 0.0;
        $scope.totalVencimento.valorLiquido = 0.0;
        
        $scope.vencimentos = [];
        
        //console.log(valDesejado);
        //console.log("Taxa: " + valTaxa);
        //console.log("IOF: " + valIOF);
        //console.log("IOF fixo: " + valIOFFixo);
        
        for(var k = 0; k < $scope.recebiveis.length && valDesejado > $scope.totalVencimento.valorAntecipado; k++){
            var recebivel = $scope.recebiveis[k];
            //console.log(recebivel);
            if(recebivel.valorLiquido > 0.0){
                var valorAntecipado = recebivel.valorLiquido;
                if(valDesejado < $scope.totalVencimento.valorAntecipado + valorAntecipado)
                    valorAntecipado = valDesejado - $scope.totalVencimento.valorAntecipado;
                
                //var parts = recebivel.competencia.split("/");
                //var competencia = new Date(parts[2], parts[1] - 1, parts[0]);
                var  competencia = $scope.getDataFromDate(recebivel.competencia);
                
                var diffDays = $scope.dateDiffInDays($scope.filtro.dtOperacao, competencia);
                //console.log(recebivel.competencia + " => " + diffDays + " dias");
                var valorJuros = valorAntecipado * diffDays * valTaxa / (30 * 100);
                //console.log("Juros: " + valorJuros);
                var valComJuros = valorAntecipado - valorJuros;
                var percentualIOF = valIOFFixo + diffDays * valIOF;
                var valorIOF = Math.trunc(valComJuros * percentualIOF) / 100.0; 
                //console.log("IOF: " + percentualIOF + "% => " + (valComJuros * percentualIOF / 100.0) + " => " + valorIOF);
                var valorLiquido = valComJuros - valorIOF;
                
                $scope.vencimentos.push({competencia : recebivel.competencia,
                                         //bandeira : recebivel.bandeira,
                                         valorAntecipado : valorAntecipado,
                                         dias : diffDays,
                                         valorJuros : valorJuros,
                                         valorIOF : valorIOF,
                                         valorLiquido : valorLiquido
                                        });
                
                $scope.totalVencimento.valorAntecipado += valorAntecipado;
                $scope.totalVencimento.valorIOF += valorIOF;
                $scope.totalVencimento.valorJuros += valorJuros;
                $scope.totalVencimento.valorLiquido += valorLiquido;
                
                //console.log($scope.totalVencimento.valorAntecipado);
            }
        }
        
        //console.log($scope.vencimentos);
        
        $scope.hideProgress(divPortletBodyFiltrosPos);
        $scope.hideProgress(divPortletBodyRecebiveisPos);
			
			//LIBERA A IMPRESSÃO
			$scope.statusSimulacao = true;
    }
		
		//IMPRESSÃO
		$scope.imprimir = function(){
			
			/*
			
			e = Nome da empresa
			s = Nome da tela
			n = Número de níveis
			cl = Número de colunas
			t = Token
			c = CNPJ
			f = Filial
			d = Data
			cc = Conta Corrente
			
			*/
			
			$scope.cc = "todos";
			$scope.f = "todas";
			
			$window.open('views/print#?e=' + $scope.usuariologado.grupoempresa.ds_nome + '&s=' + "Relatório de Recebíveis Futuros" +
									 '&n='+3+'&cc='+"conta"+'&cl='+5+'&t='+$scope.token+'&f='+""+
									 '&d='+ "data", '_blank');			
		}
		
		//FORMATAÇÃO DE DATA
		$scope.formataData = function(dataC, dataO){
			
			$scope.dtSplitC = dataC.split("");
			$scope.dtSplitO = dataO.split("");
			
			$scope.dia = $scope.dtSplitC[6] + $scope.dtSplitC[7];
			$scope.mes = $scope.dtSplitC[4] + $scope.dtSplitC[5];
			$scope.ano = $scope.dtSplitC[0] + $scope.dtSplitC[1] + $scope.dtSplitC[2] + $scope.dtSplitC[3];
			
			$scope.dataCorte = $scope.formataMes($scope.dia, $scope.ano, $scope.mes);
			
			$scope.dia = $scope.dtSplitO[6] + $scope.dtSplitO[7];
			$scope.mes = $scope.dtSplitO[4] + $scope.dtSplitO[5];
			$scope.ano = $scope.dtSplitO[0] + $scope.dtSplitO[1] + $scope.dtSplitO[2] + $scope.dtSplitO[3];
			
			$scope.dataOperacao = $scope.formataMes($scope.dia, $scope.ano, $scope.mes);
		}
		
		$scope.formataMes = function(dia, ano, mes){
			
			$scope.dataFormatada = "";
			
			switch (mes){
				case "01":
					$scope.dataFormatada = dia + " " + "Janeiro " + ano;
					break;
					
				case "02":
					$scope.dataFormatada = dia + " " + "fevereiro " + ano;
					break;
					
				case "03":
					$scope.dataFormatada = dia + " " + "março " + ano;
					break;
									
				case "04":
					$scope.dataFormatada = dia + " " + "abril " + ano;
					break;
					
				case "05":
					$scope.dataFormatada = dia + " " + "maio " + ano;
					break;
					
				case "06":
					$scope.dataFormatada = dia + " " + "junho " + ano;
					break;
					
				case "07":
					$scope.dataFormatada = dia + " " + "julho " + ano;
					break;
					
				case "08":
					$scope.dataFormatada = dia + " " + "agosto " + ano;
					break;
					
				case "09":
					$scope.dataFormatada = dia + " " + "setembro " + ano;
					break;
					
				case "10":
					$scope.dataFormatada = dia + " " + "outubro " + ano;
					break;
					
				case "11":
					$scope.dataFormatada = dia + " " + "novembro " + ano;
					break;
					
				case "12":
					$scope.dataFormatada = dia + " " + "dezembro " + ano;
					break;
					
				default:
					$scope.dataFormatada = "Erro de formatação"
					break;
			}
			
			return $scope.dataFormatada;
		}
}])