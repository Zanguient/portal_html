/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.3 - 04/05/2016
 *  - Filtro de status
 *
 *  Versão 1.0.2 - 29/04/2016
 *  - Sem filtro de adquirente
 *
 *  Versão 1.0.1 - 27/04/2016
 *  - Mensagem do erro da importação
 *
 *  Versão 1.0 - 28/03/2016
 *
 */

// App
angular.module("administrativo-vendas", []) 

.controller("administrativo-vendasCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             '$http',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             'Upload',
                                             '$autenticacao',
                                             function($scope,$state,$filter,$timeout,$http,
                                                      /*$campos,*/$webapi,$apis,Upload,$autenticacao){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200];                                             
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados    
    $scope.vendas = [];
    $scope.filiais = [];
    $scope.tipos = [{id: 1, nome: 'CONCILIADO'}, {id: 2, nome: 'NÃO-CONCILIADO'}, {id: 3, nome: 'CORRIGIDO'}, {id: 4, nome: 'CORREÇÃO MANUAL'}];  
    $scope.filtro = { dtImportacao : new Date(), filialImportacao : null,
                      datamin : new Date(), datamax : '', consideraPeriodo : true,
                      filial : null, nsu : '', tipo : null,
                      itens_pagina : $scope.itens_pagina[0], order : 0, 
                      pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };   
    $scope.total = { valorTotal : 0.0, totalCorrigidos : 0, totalConciliados : 0, totalCorrecaoManual : 0};                                             
    var divPortletBodyImportacaoPos = 0;                                             
    var divPortletBodyFiltrosPos = 1; // posição da div que vai receber o loading progress
    var divPortletBodyVendasPos = 2;                                                    
    // Permissões                                           
    //var permissaoAlteracao = false;
    var permissaoCadastro = false;
    //var permissaoRemocao = false;
    // UPLOAD
    var uploadEmProgresso = false;                                             
    // Flags
    $scope.exibeTela = false;  
    $scope.abrirCalendarioDataImportacao = false;  
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                              
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_vendasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Vendas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    $scope.filtro.filial = null;
                    $scope.filtro.tipo = null;
                    buscaFiliais(true);
                }else{ // reseta filiais e refaz a busca dos parâmetros 
                    $scope.filtro.filial = null;
                    $scope.filtro.tipo = null;
                    $scope.vendas = [];
                    $scope.filiais = [];
                    //$scope.adquirentes = [];
                }
                
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            //permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            //permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            if($scope.usuariologado.grupoempresa){
                buscaFiliais(true);
            }
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        if($scope.usuariologado.grupoempresa) 
            buscaFiliais(true);
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar títulos
      */
    $scope.usuarioPodeCadastrarVendas = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar títulos
      * /
    $scope.usuarioPodeAlterarTitulos = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir títulos
      * /
    $scope.usuarioPodeExcluirTitulos = function(){
        return permissaoRemocao;
    }  */                                            
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaVendas();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.vendas.length > 0) buscaVendas();
    }; 
          
                                                 
                                                 
                                                 
    // DATA IMPORTAÇÃO
    $scope.exibeCalendarioDataImportacao = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataImportacao = !$scope.abrirCalendarioDataImportacao;
    }; 
                                                 
                                                 
    // DATA RECEBIMENTO
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
         ajustaIntervaloDeData(); 
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
    };
    $scope.alterouDataMax = function(){
        if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
        else ajustaIntervaloDeData(); 
    };  
                                                 
                                                 
                                                 
                                                 
                                                 
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(buscarAdquirentes, nu_cnpj, cdAdquirente){
        
       $scope.showProgress(divPortletBodyImportacaoPos, 10000);    
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];
        
       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, 
                         valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = null;
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                //$scope.filtro.filial = $scope.filiais.length > 0 ? $scope.filiais[0] : null;
                //if($scope.filtro.filial && $scope.filtro.filial !== null)
                /*if(buscarAdquirentes)
                    buscaAdquirentes(true, cdAdquirente); // Busca adquirentes
                else{*/
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyImportacaoPos);
                //}
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyImportacaoPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial); 
        //buscaAdquirentes(false);
    };
    
                                                                                         
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      * /
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente){
 
       if(!progressEstaAberto){ 
           $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
           $scope.showProgress(divPortletBodyImportacaoPos, 10000);
       }
        
       var filtros = [{id : 103, //$campos.card.tbadquirente.stAdquirente
                       valor : 1}];
        
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           // Filtro do grupo empresa => barra administrativa
           filtros.push({id: 305, // campos.card.tbadquirente.cnpj
                         valor: $scope.filtro.filial.nu_cnpj});
       }     
       
       $webapi.get($apis.getUrl($apis.card.tbadquirente, 
                                [$scope.token, 1, 101], //$campos.card.tbadquirente.nmAdquirente
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(typeof cdAdquirente === 'number' && cdAdquirente > 0) 
                    $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === cdAdquirente;})[0];
                else $scope.filtro.adquirente = null;
                
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyImportacaoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyImportacaoPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      * /
    $scope.alterouAdquirente = function(){
        // ....
    }; */                                            
                                                 
                                                 
                                                 
                                                 
                                                 
    
        
    // BUSCA TÍTULOS
    /**
      * Faz a busca baseado nos filtros selecionados
      */
    $scope.buscaVendas = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        buscaVendas();    
    }
    
    
    $scope.limpaFiltros = function(){
        // Limpar data => Refazer busca?
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
                
        //$scope.filtro.adquirente = null;
        $scope.filtro.filial = null; 
        $scope.filtro.nsu = '';
        $scope.filtro.consideraPeriodo = true;
    }
    
    /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
       var filtros = [];
        
       // Data
       var filtroData = {//id: $campos.card.tbrecebimentovenda.dtVenda,
                          id: 103,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};  
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       //filtros.push(filtroData);
        
        
       // Filial
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           var filtroFilial = {id: 101,//$campos.card.tbrecebimentovenda.nrCNPJ  
                               valor: $scope.filtro.filial.nu_cnpj};
           filtros.push(filtroFilial);  
       }
        
       // Adquirente
       if($scope.filtro.tipo && $scope.filtro.tipo !== null){
           var filtroTipo = {id: 200,//$campos.card.tbrecebimentovenda.tipo, 
                             valor: $scope.filtro.tipo.id};
           filtros.push(filtroTipo);
       } 
        
        
        //NSU
        if($scope.filtro.nsu !== null && $scope.filtro.nsu){
            var filtroNSU = {id: /*$campos.card.tbrecebimentovenda.nrNsu*/ 102,
                             valor: $scope.filtro.nsu + '%'};
            filtros.push(filtroNSU);
            
            // Considera período?
            if($scope.filtro.consideraPeriodo !== false)
                filtros.push(filtroData);
        }
        else
            // Sem nsu => considera filtro de data
            filtros.push(filtroData);

        
        return filtros;
    }
                                           
    /**
      * Busca vendas
      */
    var buscaVendas = function(progressosemexecucao){

        if(!progressosemexecucao){
            $scope.showProgress(divPortletBodyImportacaoPos, 10000);
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyVendasPos);
        }
        
        // Filtro  
        var filtros = obtemFiltrosBusca();
        
        $webapi.get($apis.getUrl($apis.card.tbrecebimentovenda,
                                [$scope.token, 2, /*$campos.card.tbrecebimentovenda.dtVenda*/ 103, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                $scope.total.totalCorrigidos = $scope.total.totalConciliados = $scope.total.totalCorrecaoManual = 0;
                $scope.total.valorTotal = 0.0;
            
                // Obtém os dados
                $scope.vendas = dados.Registros;
                //console.log(dados.Registros);
                $scope.total.totalCorrigidos = dados.Totais.totalCorrigidos;
                $scope.total.totalCorrecaoManual = dados.Totais.totalCorrecaoManual;
                $scope.total.totalConciliados = dados.Totais.totalConciliados;
                $scope.total.valorTotal = dados.Totais.valorTotal;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.vendas.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha o progress
                $scope.hideProgress(divPortletBodyImportacaoPos);
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyVendasPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao carregar vendas (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyImportacaoPos);
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyVendasPos);
              });  
    };
                                                 
                                                 
    // IMPORTA VENDAS
    $scope.importaVendas = function(){

        if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return; 
        if(!$scope.usuariologado.grupoempresa.dsAPI || $scope.usuariologado.grupoempresa.dsAPI === null){
            $scope.showModalAlerta('Empresa não possui serviço ativo!');
            return;
        }
        
        $scope.showProgress(divPortletBodyImportacaoPos, 10000);
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        $scope.showProgress(divPortletBodyVendasPos);
        
        var json = { data: $scope.getFiltroData($scope.filtro.dtImportacao),
                     nrCNPJ: $scope.filtro.filialImportacao && $scope.filtro.filialImportacao !== null ? $scope.filtro.filialImportacao.nu_cnpj : null
                   };
        
        // Requisita 
        $webapi.post($apis.getUrl($apis.card.vendaserp, undefined,
                                  {id : 'token', valor: $scope.token}), 
                                  json) 
            .then(function(dados){           

                $scope.showAlert('Vendas importadas com sucesso!', true, 'success', true);
                
                buscaVendas(true);
                // Fecha o progress
                // $scope.hideProgress(divPortletBodyImportacaoPos);
                // $scope.hideProgress(divPortletBodyFiltrosPos);
                // $scope.hideProgress(divPortletBodyVendasPos);
              },
              function(failData){
                 //console.log(failData);
                 if(failData.status === 0) $scope.showAlert('O servidor está demorando muito para responder. O processo de importação ainda está sendo realizado. Por favor, realize a consulta dos vendas mais tarde.', true, 'warning', true, true, 0); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(failData.status === 401) $scope.showModalAlerta(failData.dados);
                 else //$scope.showAlert('Houve uma falha ao carregar vendas (' + failData.status + ')', true, 'danger', true);
                     $scope.showModalAlerta('Houve uma falha ao importar as vendas. (' + (failData.dados && failData.dados !== null ? failData.dados : failData.status) + ')', 'Erro');
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyImportacaoPos);
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyVendasPos);
              });  
    }      
    
    
    
    // IMPORTA CSV
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
        
        // temp...
        $scope.showAlert("Serviço indisponível!", true, 'warning', true, false);
        return; 
        
        if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return; 
        
        
        if (files && files.length) {
            uploadEmProgresso = true;
            $scope.type = 'info';
            $scope.progresso = 0;
            // Loading progress
            $scope.showProgress(divPortletBodyFiltrosPos, 10000);
            $scope.showProgress(divPortletBodyVendasPos);
            // Pega o arquivo
            var file = files[0];
            // Avalia a extensão
            var index = file.name.lastIndexOf('.');
            if(index === -1 || file.name.toLowerCase().substr(index + 1) !== 'csv'){ 
                // Extensão não é CSV
                //console.log("ARQUIVO '" + file.name + "' NÃO É UM .csv");
                $scope.showAlert("O arquivo deve ser do tipo .csv!", true, 'warning', true, false);
                uploadEmProgresso = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyVendasPos);
                return;
            }
            
            // Envia o arquivo
            var url = $apis.getUrl($apis.card.vendaserp, $scope.token);
            // Seta para a url de download
            if(url.slice(0, "http://localhost:".length) !== "http://localhost:")
                url = url.replace($autenticacao.getUrlBase(), $autenticacao.getUrlBaseDownload());
            Upload.upload({
                url: url,
                file: file,
                method: 'PATCH'
            }).success(function (data, status, headers, config) {
                $timeout(function() {
                    uploadEmProgresso = false;
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                    $scope.hideProgress(divPortletBodyVendasPos);
                    $scope.showAlert('Importação concluída com sucesso!', true, 'success', true);
                });
            }).error(function (data, status, headers, config){
                 //console.log("erro");console.log(data);
                 if(status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(status === 503 || status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else if(status === 500) $scope.showModalAlerta(data);
                 else $scope.showAlert("Houve uma falha ao fazer upload do CSV '" + file.name + "' (" + status + ")", true, 'danger', true, false);
                // Remove o progress
                uploadEmProgresso = false;
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyVendasPos);
            });
        }
    };         
    
    $scope.importaCSV = function(){
        
        if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null) return; 
        
        console.log("importa csv");
        
    }
    
    
    $scope.avaliaNsu = function(){
        if(!$scope.filtro.nsu)
            $scope.filtro.consideraPeriodo = true;
    }
                       
    
    
}]);