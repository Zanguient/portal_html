/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-extratos-bancarios", ['ngFileUpload']) 

.controller("administrativo-extratos-bancariosCtrl", ['$scope',
                                             '$state',
                                             '$stateParams',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             'Upload',
                                             function($scope,$state,$stateParams,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis,Upload){ 
                                                
    // Filtros
    $scope.extrato = [];
    $scope.contas = [];         
    var dataAtual = new Date();    
    $scope.anoDigitado = dataAtual.getFullYear();  
    $scope.totais = { extrato : 0, movimentacao : 0 };
    $scope.filtro = {conta : null, 
                     ano :  dataAtual.getFullYear(),  // ano corrente
                     mes : dataAtual.getMonth()}; // mês corrente
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyExtratosPos = 1; // posição da div que vai receber o loading progress
    $scope.mes = { janeiro : { active: false, disabled : false }, 
                   fevereiro: { active: false, disabled : false }, 
                   marco : { active: false, disabled : false },
                   abril : { active: false, disabled : false },
                   maio : { active: false, disabled : false }, 
                   junho : { active: false, disabled : false }, 
                   julho : { active: false, disabled : false }, 
                   agosto : { active: false, disabled : false },
                   setembro : { active: false, disabled : false }, 
                   outubro : { active: false, disabled : false },
                   novembro : { active: false, disabled : false }, 
                   dezembro : { active: false, disabled : false },
                 };
    // UPLOAD
    var uploadEmProgresso = false;
    $scope.progresso = 0;
    $scope.type = 'info';
    $scope.current = 0;
    $scope.total = 0;                                             
    // flag
    $scope.buscandoExtrato = false;
    $scope.exibeTela = false;                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                                 

    // Inicialização do controller
    $scope.administrativo_extratosBancariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Extratos Bancários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega contas
            if($scope.usuariologado.grupoempresa) buscaContas();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        
        // Seleciona o mês corrente
        $scope.setTab($scope.filtro.mes + 1);
        ajustaTabs();
        
        // Tem parâmetro?
        if($stateParams.conta !== null)
            $scope.filtro.conta = $stateParams.conta;
            
        // Carrega contas
        //if($scope.usuariologado.grupoempresa) buscaContas();
        
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de contas
                    $scope.filtro.conta = null;
                    buscaContas();
                }else{ // reseta tudo e não faz buscas 
                    $scope.extrato = []; 
                    $scope.contas = [];
                    $scope.filtro.conta = null;
                }
            }
        });
        
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar extratos
      */
    $scope.usuarioPodeCadastrarExtratos = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.conta !== null && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar extratos
      */
    $scope.usuarioPodeAlterarExtratos = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.conta !== null && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir extratos
      */
    $scope.usuarioPodeExcluirExtratos = function(){
        return $scope.usuariologado.grupoempresa && $scope.filtro.conta !== null && permissaoRemocao;
    }                                              
                                                 
    
    
                                                 
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){

        $scope.filtro.conta = null; 

        if($scope.contas.length > 0 && $scope.filtro.conta !== $scope.contas[0]){
            $scope.filtro.conta = $scope.contas[0]; 
            buscaExtrato();
        }
    }
    
    // CONTAS
    $scope.getNomeAmigavelConta = function(conta){
        if(!conta || conta === null) return '';
        var text = conta.banco.Codigo + ' ' + conta.banco.NomeExtenso + ' ' +
                   String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) +
                   'Ag. ' + conta.nrAgencia + ' Ct. ' + conta.nrConta;
        return text.toUpperCase();
    }
    /**
      * Busca as contas correntes
      */
    var buscaContas = function(){
        
         // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        
        // Filtro  
        var filtros = {id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                      valor: $scope.usuariologado.grupoempresa.id_grupo};
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém as contas correntes
                $scope.contas = dados.Registros;
            
                if($scope.filtro.conta && $scope.filtro.conta !== null)
                    $scope.filtro.conta = $filter('filter')($scope.contas, function(c) {return c.cdContaCorrente === $scope.filtro.conta.cdContaCorrente;})[0];
            
                if(!$scope.filtro.conta || $scope.filtro.conta === null)
                    $scope.filtro.conta = $scope.contas[0];
                
                // Alterou conta
                $scope.alterouConta(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });       
    };
    /**
      * Selecionou uma conta
      */
    $scope.alterouConta = function(progressemexecucao){
        // Set para o ano e mês corrente 
        $scope.filtro.ano = dataAtual.getFullYear(); 
        $scope.filtro.mes = dataAtual.getMonth();
        $scope.setTab($scope.filtro.mes + 1);
        ajustaTabs();
        // Busca extrato, caso a conta seja válida
        buscaExtrato(progressemexecucao);
    };
    
   
                                                 
                                                 
    // FILTRO DE MÊS/ANO 
    /**
      * Retorna o ano a ser exibido nas tabs
      */                                             
    $scope.getAno = function(){
        return String.fromCharCode(10,13) + $scope.filtro.ano;   
    }
    /**
      * Retorna true se o ano corrente do filtro é superior a 1900
      */
    $scope.temAnoAnterior = function(){
        return $scope.filtro.ano > 1900;   
    }
    /**
      * Retorna true se o ano corrente do filtro é inferior ao ano atual
      */
    $scope.temAnoPosterior = function(){
        return $scope.filtro.ano < dataAtual.getFullYear();   
    }
    /**
      * Informa qual o ano posterior ao corrente do filtro
      */
    $scope.anoPosterior = function(){
        return $scope.filtro.ano + 1;   
    }
    /**
      * Informa qual o ano anterior ao corrente do filtro
      */
    $scope.anoAnterior = function(){
        return $scope.filtro.ano - 1;   
    }
    /**
      * Altera efetivamente o ano exibido
      */ 
    var setAno = function(ano){
        if(ano >= 1900 && ano <= dataAtual.getFullYear()){ 
            if($scope.filtro.ano > ano)
                $scope.filtro.mes = 11; // Retrocedeu o ano
            else if($scope.filtro.ano < ano)
                $scope.filtro.mes = 0; // Avançou o ano
            $scope.filtro.ano = ano;
            ajustaTabs();
            buscaExtrato();
       }
       $scope.atualizaAnoDigitado();     
    }
    /**
      * Seta o ano em exibição para o anterior
      */
    $scope.setAnoAnterior = function(){
        setAno($scope.filtro.ano - 1);
    }
    /**
      * Seta o ano em exibição para o posterior
      */
    $scope.setAnoPosterior = function(){
        setAno($scope.filtro.ano + 1);
    }
    /**
      * Foi informado pelo usuário um ano para ser exibido
      */                                            
    $scope.alteraAno = function(){
        if($scope.anoDigitado) setAno(parseInt($scope.anoDigitado));
        else $scope.atualizaAnoDigitado();  
    }
    /**
      * Sincroniza o ano digitado com a que efetivamente está sendo exibido
      */
    $scope.atualizaAnoDigitado = function(){
        $scope.anoDigitado = $scope.filtro.ano;       
    }
    // MES
    /**
      * Retorna true se o mês informado pode ser exibido
      */
    $scope.exibeMes = function(mes){
        if(dataAtual.getFullYear > $scope.filtro.ano) return true;
        return mes <= dataAtual.getMonth();
    }
    /**
      * Retorna true se o mês informado é o mês em exibição
      */
    $scope.mesIs = function(mes){
        return $scope.filtro.mes === mes;    
    }
    
    
    // TABS
    /**
      * Ajusta o flag active e disable estáticos das tabs
      */
    var ajustaTabs = function(){
        // Seleciona a tab do mês
        var cont = 0;
        for(var key in $scope.mes){
            if ($scope.mes.hasOwnProperty(key)){
                $scope.mes[key].active = $scope.filtro.mes == cont;
                $scope.mes[key].disabled = $scope.filtro.ano > dataAtual.getFullYear() || 
                                           ($scope.filtro.ano == dataAtual.getFullYear() && 
                                            cont > dataAtual.getMonth());
            }
            cont++;
        }    
    }
    
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 12){
            $scope.tab = tab;
            $scope.filtro.mes = tab - 1;
            buscaExtrato();
        }
    }    
    
          
                                                 
                                                 
    // UPLOAD
    /**
      * Retorna true se o upload está em curso
      */
    $scope.uploadEmProgresso = function(){
        return uploadEmProgresso;    
    }
    /**
      * Faz o upload
      */
    $scope.upload = function (files) {
        if (files && files.length) {
            uploadEmProgresso = true;
            $scope.type = 'info';
            $scope.progresso = 0;
            //$scope.total = files.length;
            //$scope.current = 0;
            // Loading progress
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyExtratosPos);
            //for (var i = 0; i < $scope.total; i++) {
            var file = files[0];
            // Avalia a extensão
            var index = file.name.lastIndexOf('.');
            if(index === -1 || (file.name.substr(index + 1) !== 'ofx' && file.name.substr(index + 1) !== 'pdf')){ 
                // Extensão não é OFX e PDF
                //console.log("ARQUIVO '" + file.name + "' NÃO É UM .ofx");
                $scope.showAlert("O arquivo deve ser do tipo .ofx ou .pdf!", true, 'warning', true, false);
                //if(++$scope.current === $scope.total){
                $scope.type = 'danger';
                $scope.progresso = 100;
                uploadEmProgresso = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyExtratosPos);
                return;
                //}
                //continue;
            }
            Upload.upload({
                url: $apis.getUrl($apis.card.tbextrato, $scope.token, 
                                  {id: /*$campos.card.tbextrato.cdContaCorrente*/ 101, 
                                   valor: $scope.filtro.conta.cdContaCorrente}),
                file: file,
                method: 'PATCH'
            }).progress(function (evt) {
                $scope.progresso = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function (data, status, headers, config) {
                $timeout(function() {
                    //if(++$scope.current === $scope.total){
                    $scope.type = 'success';
                    uploadEmProgresso = false;
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyExtratosPos);
                    //}
                    //console.log(data);
                    // Recebeu o mês e ano do extrato
                    if(data && data !== null){
                        if(data.mes > 0 && data.ano > 0){
                            $scope.filtro.ano = data.ano;
                            $scope.filtro.mes = data.mes - 1;
                            $scope.tab = data.mes;
                            ajustaTabs();
                        }
                    }
                    // Relista o extrato corrente
                    buscaExtrato();
                });
            }).error(function (data, status, headers, config){
                 if(status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(status === 503 || status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(status === 500) $scope.showModalAlerta("Só são aceitos arquivos PDF de contas do SANTANDER! Se o extrato subido não foi um pdf, então o extrato '" + files[$scope.current].name + "' não corresponde a conta " + $scope.getNomeAmigavelConta($scope.filtro.conta));
                 else $scope.showAlert("Houve uma falha ao fazer upload do extrato '" + files[$scope.current] + "' (" + status + ")", true, 'danger', true, false);
                //if(++$scope.current === $scope.total){
                $scope.type = 'danger';
                uploadEmProgresso = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyExtratosPos);
                //}
            });
            //}
        }
    };                                             
                                                 
                                                 
                                                 
    // EXTRATO
             
    /**
      * Retorna os filtros para ser usado junto a url para requisição via webapi
      */
    var obtemFiltroDeBusca = function(){
       var filtros = [];
       // Filial
       var filtroConta = {id: /*$campos.card.tbextrato.cdContaCorrente*/ 101, 
                           valor: $scope.filtro.conta.cdContaCorrente};
       filtros.push(filtroConta);  
        
       // Período
       filtros.push({id : /*$campos.card.tbextrato.dtExtrato*/ 102,
                     valor: $scope.getFiltroDataString($scope.filtro.ano, $scope.filtro.mes + 1)});
       
       // Retorna    
       return filtros;
    }  
                                                                                        
                                                 
                                                 
    /**
      * Efetiva a busca
      */
    var buscaExtrato = function(progressoemexecucao){
        
        if(!$scope.filtro.conta || $scope.filtro.conta === null){ 
            if(progressoemexecucao) $scope.hideProgress(divPortletBodyFiltrosPos);  
            return;
        }
       
        $scope.buscandoExtrato = true;
        
        if(!progressoemexecucao) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        $scope.showProgress(divPortletBodyExtratosPos);
        
        var filtros = obtemFiltroDeBusca();
       
        $webapi.get($apis.getUrl($apis.card.tbextrato, 
                                [$scope.token, 1, /*$campos.card.tbextrato.dtExtrato*/ 102, 0],
                                filtros)) 
            .then(function(dados){
                $scope.totais.extrato = 0;
                $scope.totais.movimentacao = dados.TotalDeRegistros;
                $scope.extrato = dados.Registros;
                $scope.buscandoExtrato = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyExtratosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter extrato bancário (' + failData.status + ')', true, 'danger', true);
                 $scope.buscandoExtrato = false;
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyExtratosPos);
              });             
    }  
    
    /**
      * Soma valor ao total do extrato
      */
    $scope.incrementaValorTotalExtrato = function(valor){
        //console.log(valor);
        //console.log($scope.totais.extrato);
        $scope.totais.extrato += valor;  
    }
    
    
}]);